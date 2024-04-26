import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import React from "react";
import { icons, images } from "../constants";
import { router, usePathname } from "expo-router";

const SearchInput = ({initialQuery}) => {
  const pathName = usePathname()
  const [ query, setQuery] = useState(initialQuery || '')


  return (

    <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center space--x-4">
        <TextInput
          className="text-base mt-5 text-white flex-1 font-pregular"
          value={query}
          placeholder="Search fo a video topic"
          placeholderTextColor="#7b7b8b"
          onChangeText={(e) => setQuery(e)}
        />

        <TouchableOpacity
        onPress={()=> {
          if (!query) {
            return Alert.alert('Missing query', "Please input something to search results accros the database")
          }

          if (pathName.startsWith('/search/${query}')) router.setParams({ query })
          else router.push('/search/${query}')
        }}
        >
          <Image
              source={icons.search}
              className="w-5 h-5"
              resizeMode="contain"
          />
        </TouchableOpacity>
    </View>
 );
};

export default SearchInput;