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
        const response = await axiosInstance.post("/auth/login-by-password", {
            email, password
        })
        console.log("Login:", response.data)
        return response.data;
    } catch (error) {
        console.error("Error:", error)
    }
}


export const profileUser = async () => {
    try {
        const response = await axiosInstance.get('users/profile');
        console.log('Profile:', response.data);
        return response;
    } catch (error) {
        throw error;
    }
}

export const editProfile = async (data: { name: string, email: string, phone: string }) => {
    try {
        const response = await axiosInstance.put('users/profile', data);
        console.log('Profile:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

