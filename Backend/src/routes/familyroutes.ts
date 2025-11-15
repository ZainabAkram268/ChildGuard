// frontend/src/services/reportService.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ReportData {
  location: string;
  description: string;
  child_name: string;
  child_age: number;
  photo_url?: string;
  phone?: string;
}

export const submitChildLaborReport = async (report: ReportData) => {
  try {
    const response = await axios.post(`${API_URL}/reports`, report, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return Promise.reject(error.response.data);
      } else if (error.request) {
        return Promise.reject({ error: 'No response from server. Check your connection.' });
      } else {
        return Promise.reject({ error: 'Request setup failed.' });
      }
    } else {
      return Promise.reject({ error: 'An unexpected error occurred.' });
    }
  }
};
