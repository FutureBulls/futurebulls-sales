import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { courseDetails } from "@/app/services/course.service";

interface CourseState {
  coursesData: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

// Define the thunk type
export const fetchCoursesData = createAsyncThunk<CourseState["coursesData"],void>(
    'courses/fetchCoursesData',
    async () => {
        const response = await courseDetails();
        return response.data.courses;
    }
);

const initialState: CourseState = {
  coursesData: [],
  status: "idle",
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursesData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCoursesData.fulfilled,
        (state, action: PayloadAction<CourseState["coursesData"]>) => {
          state.status = "succeeded";
          state.coursesData = action.payload;
        },
      )
      .addCase(fetchCoursesData.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default courseSlice.reducer;
