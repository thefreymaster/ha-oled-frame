import { useState, useEffect } from "react";
import { Box, Text, HStack, VStack } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";
import { useSocket } from "../hooks/useSocket";
import { socket } from "../lib/socket";
import { setDeviceMode } from "../lib/deviceMode";
import { useThemeMode } from "../hooks/useThemeMode";
import type { ThemeModePreference } from "../lib/themeMode";

const VIEWS = [
  { path: "/home", label: "Overview" },
  { path: "/clock", label: "Analog Clock" },
  { path: "/digital", label: "Digital Clock" },
  { path: "/photos", label: "Photo Slideshow" },
  { path: "/blank", label: "Blank Screen" },
];

const THEME_MODES: { value: ThemeModePreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "bright", label: "Bright" },
  { value: "dark", label: "Dark" },
];

function nextPhoto() {
  socket.emit("next_photo");
}

export function Control() {
  const { connected } = useSocket();
  const { preference, effectiveMode, setPreference } = useThemeMode();
  const [activeView, setActiveView] = useState<string | null>(null);

  useEffect(() => {
    function onCurrentView(view: string) {
      setActiveView(`/${view}`);
    }
    function onChangeView(view: string) {
      setActiveView(`/${view}`);
    }
    socket.on("current_view", onCurrentView);
    socket.on("change_view", onChangeView);
    return () => {
      socket.off("current_view", onCurrentView);
      socket.off("change_view", onChangeView);
    };
  }, []);

  function changeView(path: string) {
    socket.emit("change", path.replace("/", ""));
    setActiveView(path);
  }

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      bg="#000"
      px="8vmin"
      py="12vmin"
      display="flex"
      flexDirection="column"
    >
      {/* Use as frame */}
      <Text
        fontSize="3.5vmin"
        color="gray.700"
        cursor="pointer"
        _active={{ opacity: 0.5 }}
        mb="4.5vmin"
        onClick={() => {
          setDeviceMode("frame");
          window.location.href = "/home";
        }}
      >
        Use as display frame
      </Text>
      <Box height="1px" bg="gray.900" mb="8vmin" />

      {/* Header */}
      <HStack justify="space-between" align="baseline" mb="8vmin">
        <Text
          fontSize="5vmin"
          color="gray.400"
          fontWeight="300"
          letterSpacing="0.02em"
        >
          Control
        </Text>
        <HStack gap="1.5vmin" align="center">
          <Box
            width="5px"
            height="5px"
            borderRadius="full"
            bg={connected ? "green.700" : "gray.800"}
          />
          <Text fontSize="3vmin" color="gray.700">
            {connected ? "connected" : "disconnected"}
          </Text>
        </HStack>
      </HStack>

      {/* View rows */}
      <VStack gap={0} align="stretch" width="100%">
        {VIEWS.map((v, i) => {
          const isActive = activeView === v.path;
          const isPhotos = v.path === "/photos";

          return (
            <Box key={v.path}>
              {i > 0 && <Box height="1px" bg="gray.900" />}
              <HStack
                justify="space-between"
                align="center"
                py="4.5vmin"
                cursor="pointer"
                onClick={() => changeView(v.path)}
                _active={{ opacity: 0.5 }}
              >
                <Text
                  fontSize="4.5vmin"
                  fontWeight={isActive ? "400" : "300"}
                  color={isActive ? "white" : "gray.500"}
                  letterSpacing="0.01em"
                >
                  {v.label}
                </Text>
                <HStack gap="3vmin" align="center">
                  {isActive && (
                    <Box
                      width="5px"
                      height="5px"
                      borderRadius="full"
                      bg="white"
                    />
                  )}
                  {isPhotos && (
                    <Box
                      as="button"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        nextPhoto();
                      }}
                      color="gray.700"
                      _hover={{ color: "gray.400" }}
                      display="flex"
                      alignItems="center"
                      p="1vmin"
                    >
                      <MdSkipNext size={20} />
                    </Box>
                  )}
                </HStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {/* Display mode */}
      <Box mt="10vmin">
        <HStack justify="space-between" align="baseline" mb="3vmin">
          <Text
            fontSize="3.2vmin"
            color="gray.600"
            letterSpacing="0.12em"
            textTransform="uppercase"
          >
            Display mode
          </Text>
          {preference === "auto" && (
            <Text fontSize="2.8vmin" color="gray.700">
              auto · {effectiveMode}
            </Text>
          )}
        </HStack>
        <HStack gap="2vmin" width="100%">
          {THEME_MODES.map((m) => {
            const isActive = preference === m.value;
            return (
              <Box
                key={m.value}
                as="button"
                flex="1"
                py="3.5vmin"
                borderRadius="8px"
                bg={isActive ? "whiteAlpha.100" : "transparent"}
                border="1px solid"
                borderColor={isActive ? "gray.700" : "gray.900"}
                onClick={() => setPreference(m.value)}
                _active={{ opacity: 0.5 }}
              >
                <Text
                  fontSize="3.6vmin"
                  fontWeight={isActive ? "400" : "300"}
                  color={isActive ? "white" : "gray.500"}
                  letterSpacing="0.02em"
                >
                  {m.label}
                </Text>
              </Box>
            );
          })}
        </HStack>
      </Box>

    </Box>
  );
}
