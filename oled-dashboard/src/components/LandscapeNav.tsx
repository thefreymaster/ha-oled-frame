import { useState, useEffect } from "react";
import { Box, HStack, VStack, Spacer, Flex } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router";
import { MdHome, MdPin, MdPhoto, MdTune } from "react-icons/md";
import { BsClockFill } from "react-icons/bs";
import { socket } from "../lib/socket";

const NAV_ITEMS = [
  { path: "/home", icon: MdHome },
  { path: "/clock", icon: BsClockFill },
  { path: "/digital", icon: MdPin },
  { path: "/photos", icon: MdPhoto },
];

const BOTTOM_NAV_ITEMS = [
  { path: "/control", icon: MdTune },
];

export function LandscapeNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(location.pathname);

  useEffect(() => {
    setActiveView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    function onChangeView(view: string) {
      setActiveView(`/${view}`);
    }
    socket.on("change_view", onChangeView);
    return () => {
      socket.off("change_view", onChangeView);
    };
  }, []);

  function handleClick(path: string) {
    navigate(path);
    if (path !== "/control") {
      socket.emit("change", path.replace("/", ""));
    }
    setActiveView(path);
  }

  function renderItem(item: { path: string; icon: typeof MdHome }) {
    const isActive = activeView === item.path;
    const Icon = item.icon;
    return (
      <Box
        key={item.path}
        as="button"
        onClick={() => handleClick(item.path)}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="40px"
        height="40px"
        borderRadius="8px"
        bg="transparent"
        color={isActive ? "var(--theme-fg)" : "var(--theme-fg-muted)"}
        _hover={{ color: "var(--theme-fg)" }}
        _active={{ opacity: 0.5 }}
        transition="all 0.15s"
      >
        <Icon size={22} />
      </Box>
    );
  }

  const allItems = [...NAV_ITEMS, ...BOTTOM_NAV_ITEMS];

  return (
    <>
      {/* Portrait: bottom horizontal bar */}
      <Box
        css={{
          display: "block",
          "@media (orientation: landscape)": { display: "none" },
        }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        height="56px"
        bg="var(--theme-bg)"
        borderTop="1px solid"
        borderColor="var(--theme-divider)"
        zIndex={100}
      >
        <HStack justify="space-around" align="center" height="100%" px="8px">
          {allItems.map(renderItem)}
        </HStack>
      </Box>

      {/* Landscape: left vertical sidebar */}
      <Box
        css={{
          display: "none",
          "@media (orientation: landscape)": { display: "block" },
        }}
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        width="56px"
        bg="var(--theme-bg)"
        borderRight="1px solid"
        borderColor="var(--theme-divider)"
        zIndex={100}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          height="100%"
          py="16px"
        >
          <Spacer />
          <VStack gap="6px">{NAV_ITEMS.map(renderItem)}</VStack>
          <Spacer />
          <VStack gap="6px">{BOTTOM_NAV_ITEMS.map(renderItem)}</VStack>
        </Flex>
      </Box>
    </>
  );
}
