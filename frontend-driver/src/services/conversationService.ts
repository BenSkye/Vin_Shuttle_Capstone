import apiClient from '~/services/apiClient';

export const getConversationById = async (id: string) => {
  try {
    console.log('id', id);
    const response = await apiClient.get(`/conversation/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching personal conversation:', error);
    throw error;
  }
};

export const getPersonalConversations = async () => {
  try {
    const response = await apiClient.get('/conversation/personal-conversation');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching personal conversation:', error);
    throw error;
  }
};
