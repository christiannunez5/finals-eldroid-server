import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
dotenv.config();

export const ngrokListener = async () => {
    // create session
    const session = await new ngrok.SessionBuilder()
        .authtoken("2nT8uLvd635USyUVuvOtArFN51w_3VoWs3s5g7RiMGDMLjWMg")
        .metadata("Online test")
        .connect();

    // create listener
    const listener = await session
        .httpEndpoint()
        .requestHeader("X-Req-Yup", "true")
        .listen();

    return listener;
};
