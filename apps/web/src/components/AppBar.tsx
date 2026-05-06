import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useSearchParams } from "react-router";

import { routeNames } from "@/Routes";
import Searchbar from "@/components/Searchbar";
import KeyboardShortcut from "@/components/general/KeyboardShortcut";
import SettingsMenu from "@/components/general/SettingsMenu";
import { useDrawer } from "@/context/DrawerContext";
import { useAuthStore } from "@/store/auth";

import { SideDrawer } from "./main";
import RefreshButton from "./refresh";

function AppBar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { isDrawerOpen, setDrawerIsOpen } = useDrawer();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shouldShowToolbar, setShouldShowToolbar] = useState(true);
  const [shouldShowSearchbar, setShouldShowSearchbar] = useState(false);

  const shouldShow = useMemo(() => {
    if (location.pathname.includes("/reset-password")) {
      return true;
    }
    return !!routeNames.find((item) => item === location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!!searchParams.get("q") && !shouldShowSearchbar) {
      setShouldShowToolbar(false);
      setShouldShowSearchbar(true);
    }
  }, [searchParams, shouldShowSearchbar]);

  return (
    <Fragment>
      <Slide direction="down" in={shouldShow}>
        <MuiAppBar position="static">
          <div ref={nodeRef} className="overflow-hidden">
            <Toolbar>
              <Slide
                direction="down"
                in={shouldShowToolbar}
                mountOnEnter
                unmountOnExit
                container={nodeRef.current}
                onExited={() => setShouldShowSearchbar(true)}
              >
                <Box
                  flexGrow={1}
                  display="flex"
                  alignItems="center"
                  position="relative"
                >
                  {user && (
                    <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{ mr: 2 }}
                      onClick={() => {
                        setDrawerIsOpen(!isDrawerOpen);
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Typography component="div" variant="h6" sx={{ flexGrow: 1 }}>
                    Cinememo
                  </Typography>
                  <div className="space-x-2">
                    {user?.id ? (
                      <>
                        <Tooltip title="Search">
                          <IconButton
                            onClick={() => setShouldShowToolbar(false)}
                          >
                            <SearchIcon htmlColor="#fff" />
                          </IconButton>
                        </Tooltip>
                        <RefreshButton />
                      </>
                    ) : null}
                    <SettingsMenu />
                  </div>
                </Box>
              </Slide>
              <Slide
                direction="up"
                in={shouldShowSearchbar}
                mountOnEnter
                unmountOnExit
                container={nodeRef.current}
                onExited={() => {
                  setShouldShowToolbar(true);
                }}
              >
                <Box
                  flexGrow={1}
                  display="flex"
                  alignItems="center"
                  position="relative"
                  justifyContent="space-between"
                  gap="1rem"
                >
                  <Searchbar />
                  <Tooltip title="Close">
                    <IconButton
                      onClick={() => {
                        if (searchParams.get("q")) {
                          searchParams.delete("q");
                          setSearchParams(searchParams);
                        }
                        setShouldShowSearchbar(false);
                      }}
                    >
                      <ClearIcon htmlColor="#fff" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Slide>
            </Toolbar>
          </div>
        </MuiAppBar>
      </Slide>
      <KeyboardShortcut />
      {user ? <SideDrawer /> : null}
    </Fragment>
  );
}

export default AppBar;
