import axiosInstance from "./axios";


const getRating = async () => {
    try {
        const response = await axiosInstance.get('/ratings')
        return response.data
    } catch (error) {
        console.error('Error fetching ratings:', error)
        throw error
    }
}