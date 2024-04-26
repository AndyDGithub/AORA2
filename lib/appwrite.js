import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';


export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: 'com.jsm.aora2',
    projectId: '6628cb648fac15d3bc07',
    databaseId: '6628cd6c924a94fcf788',
    userCollectionId: '6628cdb43af3c96265f4',
    videoCollectionId: '6628cde865abf29b4384',
    storageId: '6628cfe513aabc7d930f'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId
} = config

// Init your react-native SDK
const client = new Client();
const avatars = new Avatars(client);
const database = new Databases(client);
const storage = new Storage(client);


client
.setEndpoint(config.endpoint)
.setProject(config.projectId) 
.setPlatform(config.platform) 

    const account = new Account(client);

export const createUser = async (email, pasword, username) => {
    try {
        const newAccount = await account.create(
        ID.unique(),
        email,
        pasword,
        username
        )
    if (!newAccount) throw Error;

    const avatarURL = avatars.getInitials(username)

    await signIn(email, pasword)

    const newUser = await database.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarURL
        }
    )
    return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password)
        return session;
    } catch (error) {
        throw new Error(error);
        
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()

        if (!currentAccount) throw Error;

        const currentUser = await database.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
    }
}

export const getAllPosts = async () => {
    try {
      const posts = await database.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.orderDesc('$createdAt')]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try {
      const posts = await database.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.orderDesc('$createdAt', Query.limit(7))]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await database.listDocuments(
          databaseId,
          videoCollectionId,
          [Query.search('title', query)]
        );
    
        return posts.documents;
      } catch (error) {
        throw new Error(error);
      }
}

export const getUserPosts = async (userId) => {
    try {
        const posts = await database.listDocuments(
          databaseId,
          videoCollectionId,
          [Query.equal('creator', userId)]
        );
    
        return posts.documents;
      } catch (error) {
        throw new Error(error);
      }
}

export const signOut = async () => {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === 'video'){
      fileUrl = storage.getFileView(storageId, fileId)
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
    } else {
      throw new Error('Invalide file type ')
    }

    if (!fileUrl) throw Error

    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if (!file) return

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.filesize,
    uri: file.uri,
  }

  try {
    const uploadFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    )

    const fileUrl = await getFilePreview(uploadFile.$id, type)

    return fileUrl
    
  } catch (error) {
    throw new Error(error)
  }
}

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video')
    ])

    const newPost = await database.createDocument(
      databaseId, videoCollectionId, ID.unique(), {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId
      }
    )

    return newPost
  } catch (error) {
    throw new Error(error)
  }
}