export interface User {
role: string;
userId: number;   // coming from API
  Name: string;
  Email: string;
  Status: 'active' | 'inactive';
  CreatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
}

class UserApi {
  static async getUsers(): Promise<ApiResponse<User[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // http://127.0.0.1:8000/api/users
    return {
      data: []

    };
  }

  static async updateUser(user: User): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: user };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async deleteUser(id: number): Promise<ApiResponse<null>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: null , };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateUserStatus(id: number, status: 'active' | 'inactive'): Promise<ApiResponse<null>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: null };
  }
}

export default UserApi;