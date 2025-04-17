import { createSlice } from "@reduxjs/toolkit";

export interface SidebarState {
  sidebar: boolean;
}
const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    sidebar: false,
  } as SidebarState,
  reducers: {
    openSidebar(state) {
      state.sidebar = true;
    },
    closeSidebar(state) {
      state.sidebar = false;
    },
  },
});

export const { openSidebar, closeSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
