import React from "react";
import { AppRoutes } from "./routes";
import { MainLayout } from "./components/layout/MainLayout";

const App: React.FC = () => {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
};

export default App;
