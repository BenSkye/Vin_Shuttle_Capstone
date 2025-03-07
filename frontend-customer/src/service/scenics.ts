import apiClient from "./apiClient"



export const getSenicRoute = async () => {
    try {
        const response = apiClient.get("/scenic-route");
        return response;
    } catch (e) {
        console.log("Error", e)
    }
}