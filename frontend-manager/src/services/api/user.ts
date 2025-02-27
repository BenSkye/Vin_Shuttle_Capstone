import axiosInstance from "./axios"

export const getCustomer = async () => {
    try {
        const respone = await axiosInstance.get("/users/get-user-by-role/customer");
        console.log("User:", respone.data)
        return respone.data;
    } catch (error) {
        console.error("Error:", error)
    }
}

export const getDriver = async () => {
    try {
        const respone = await axiosInstance.get("/users/get-user-by-role/driver");
        console.log("Driver:", respone.data)
        return respone.data;
    }
    catch (error) {
        console.error("Error:", error)
    }
}


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axiosInstance.post("http://localhost:2028/auth/login-by-password", {
            email, password
        })
        console.log("Login:", response.data)
        return response.data;
    } catch (error) {
        console.error("Error:", error)
    }
}
