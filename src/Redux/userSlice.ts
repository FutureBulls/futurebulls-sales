// userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getSingleUserData } from '@/app/services/user.service';

interface UserState {
  userData: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// Define the thunk type
export const fetchUserData = createAsyncThunk<UserState['userData'], void>(
  'user/fetchUserData',
  async () => {
    const response = await getSingleUserData();
    return response.data;
  }
);

const initialState: UserState = {
  userData: null,
  status: 'idle',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action: PayloadAction<UserState['userData']>) => {
        state.status = 'succeeded';
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default userSlice.reducer;