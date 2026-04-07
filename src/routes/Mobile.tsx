import { useState } from "react";
import { Box, VStack, Text, HStack, ButtonGroup, Button } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";
import { ViewButton } from "../components/ViewButton";
import { useSocket } from "../hooks/useSocket";
import { socket } from "../lib/socket";

const VIEWS = [
  { path: "/clock", label: "Clock & Weather" },
  { path: "/photos", label: "Photo Slideshow" },
  { path: "/blank", label: "Blank Screen" },
];

function nextPhoto() {
  socket.emit("next_photo");
}

export function Mobile() {
  const { connected } = useSocket();
  const [activeView, setActiveView] = useState<string | null>(null);

  function changeView(path: string) {
    const view = path.replace("/", "");
    socket.emit("change", view);
    setActiveView(path);
  }

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      bg="black"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={6}
      py={12}
    >
      <VStack gap={8} width="100%" maxWidth="380px">
        <VStack gap={1}>
          <Text fontSize="xl" color="gray.300" letterSpacing="0.1em">
            CONTROL
          </Text>
          <HStack gap={2} align="center">
            <Box
              width="6px"
              height="6px"
              borderRadius="full"
              bg={connected ? "green.600" : "red.800"}
            />
            <Text fontSize="xs" color="gray.700">
              {connected ? "connected" : "disconnected"}
            </Text>
          </HStack>
        </VStack>

        <VStack gap={3} width="100%">
          {VIEWS.map((v) =>
            v.path === "/photos" ? (
              <ButtonGroup key={v.path} attached width="100%">
                <Button
                  flex={1}
                  size="lg"
                  variant={activeView === v.path ? "solid" : "outline"}
                  bg={activeView === v.path ? "gray.700" : "transparent"}
                  borderColor="gray.600"
                  color={activeView === v.path ? "white" : "gray.300"}
                  _hover={{ bg: "gray.700", color: "white" }}
                  letterSpacing="0.05em"
                  height="60px"
                  fontSize="lg"
                  onClick={() => changeView(v.path)}
                >
                  {v.label}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="gray.600"
                  color="gray.300"
                  _hover={{ bg: "gray.700", color: "white" }}
                  height="60px"
                  px={5}
                  onClick={nextPhoto}
                >
                  <MdSkipNext size={24} />
                </Button>
              </ButtonGroup>
            ) : (
              <ViewButton
                key={v.path}
                label={v.label}
                active={activeView === v.path}
                onClick={() => changeView(v.path)}
              />
            ),
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
