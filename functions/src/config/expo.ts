import { Expo } from "expo-server-sdk";

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export default expo;
