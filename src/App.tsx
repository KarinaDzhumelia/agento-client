import {
  AuthBindings,
  Authenticated,
  GitHubBanner,
  Refine,
  LegacyAuthProvider as AuthProvider,
  ReadyPage,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/react-router-v6/legacy";


import {
  ErrorComponent,
  notificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";
import {
  AccountCircleOutlined,
  PeopleAltOutlined,
  VillaOutlined,
} from '@mui/icons-material'

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import axios from "axios";
import { CredentialResponse } from "interfaces/google";

import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { parseJwt } from "utils/parse-jwt";
import { Header } from "./components/layout/header";
import { ColorModeContextProvider } from "./contexts/color-mode";

import {
  Login,
  Home,
  Agents,
  MyProfile,
  PropertyDetails,
  AllProperties,
  CreateProperty,
  AgentProfile,
  EditProperty,
} from "./pages";
import { Layout, Sider, Title } from "components/layout";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

function App() {
  const authProvider: AuthBindings = {
    login: async ({ credential }: CredentialResponse) => {
      const profileObj = credential ? parseJwt(credential) : null;

      // if (profileObj) {
      //   localStorage.setItem(
      //     "user",
      //     JSON.stringify({
      //       ...profileObj,
      //       avatar: profileObj.picture,
      //     })
      //   );

      //   localStorage.setItem("token", `${credential}`);

      //   return {
      //     success: true,
      //     redirectTo: "/",
      //   };
      // }

      // return {
      //   success: false,
      // };
      if (profileObj) {
        const response = await fetch(
            "http://localhost:8080/api/v1/users",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profileObj.name,
                    email: profileObj.email,
                    avatar: profileObj.picture,
                }),
            },
        );

        const data = await response.json();

        if (response.status === 200) {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...profileObj,
                    avatar: profileObj.picture,
                    userid: data._id,
                }),
            );
        } else {
          return {
              success: false,
            };
        }
    }
    localStorage.setItem("token", `${credential}`);

    return {
          success: true,
          redirectTo: "/",
        };
    },
    logout: async () => {
      const token = localStorage.getItem("token");

      if (token && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        axios.defaults.headers.common = {};
        window.google?.accounts.id.revoke(token, () => {
          return {};
        });
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      const token = localStorage.getItem("token");

      if (token) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        error: {
          message: "Check failed",
          name: "Token not found",
        },
        logout: true,
        redirectTo: "/login",
      };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      // const user = localStorage.getItem("user");
      // if (user) {
      //   return JSON.parse(user);
      //   console.log(user);
      // }

      // return null;

      // Retrieve user data from local storage
      const storedUserData = localStorage.getItem('user');
      // Parse the stored user data if it exists
      const user = storedUserData ? JSON.parse(storedUserData) : null;
      // console.log(user.email);
      return user;
      
    },
  };

  return (
    <BrowserRouter>
      {/* <GitHubBanner /> */}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            {/* <DevtoolsProvider> */}
            <Refine
                dataProvider={dataProvider("http://localhost:8080/api/v1")}
                notificationProvider={notificationProvider}
                ReadyPage={ReadyPage}
                catchAll={<ErrorComponent />}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "properties",
                    list: AllProperties,
                    show: PropertyDetails,
                    create: CreateProperty,
                    edit: EditProperty,
                    icon: <VillaOutlined />
                  },
                  {
                    name: "agents",
                    list: Agents,
                    show: AgentProfile,
                    icon: <PeopleAltOutlined />
                  },
                  {
                    name: "my-profile",
                    options: { label: 'My profile' },
                    list: MyProfile,
                    icon: <AccountCircleOutlined />
                  },
                ]}
                Title={Title}
                Sider={Sider}
                Layout={Layout}
                Header={Header}
                legacyRouterProvider={routerProvider}
                // legacyAuthProvider={authProvider}
                LoginPage={Login}
                DashboardPage={Home}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "J6mF9h-FzbzP0-Kj5fRM",
                }}
              >
                <Routes>
                  {/* <Route path="*" element={<Home />} /> */}
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          // Header={() => <Header isSticky={true} />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >                  
                  <Route path="*" element={<ErrorComponent />} />
                  <Route
                      index
                      element={<Home />}
                  />
                  <Route path="/properties">
                    <Route index element={<AllProperties />} />
                    <Route path="create" element={<CreateProperty />} />
                    <Route path="show/:id" element={<PropertyDetails />} />
                    <Route path="edit/:id" element={<EditProperty />} />
                  </Route>
                  <Route path="/agents">
                    <Route index element={<Agents />} />
                    <Route path="show/:id" element={<AgentProfile />} />
                  </Route>
                  <Route path="/my-profile" element={<MyProfile />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                  </Route>                  
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              {/* <DevtoolsPanel />
            </DevtoolsProvider> */}
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
