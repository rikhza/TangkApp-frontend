import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  // Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
      <div className="min-h-screen bg-blue-gray-50/50">
          {/* Sidenav Component */}
          <Sidenav
              routes={routes}
              brandImg={
                  sidenavType === 'dark'
                      ? '/img/logo-ct.png'
                      : '/img/logo-ct-dark.png'
              }
          />

          {/* Main Content Area */}
          <div className="p-4 xl:ml-80">
              {/* Navbar */}
              <DashboardNavbar />

              {/* Configurator (optional) */}
              <Configurator />

              {/* Optional Icon Button */}
              {/* 
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton> 
        */}

              {/* Routes */}
              <Routes>
                  {/* Iterate over routes and render the Route for each path in the layout */}
                  {routes.map(({ layout, pages }) =>
                      layout === 'dashboard'
                          ? pages.map(({ path, element, subRoutes }) => (
                                <Route key={path} path={path} element={element}>
                                    {/* Render sub-routes if they exist */}
                                    {subRoutes &&
                                        subRoutes.map(
                                            ({
                                                path: subPath,
                                                element: subElement,
                                            }) => (
                                                <Route
                                                    key={subPath}
                                                    path={subPath}
                                                    element={subElement}
                                                />
                                            )
                                        )}
                                </Route>
                            ))
                          : null
                  )}
              </Routes>

              {/* Footer (optional) */}
              {/* <Footer /> */}
          </div>
      </div>
  )
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
