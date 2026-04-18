import { Box } from "@chakra-ui/react";

interface Props {
  mb?: string;
}

export function Divider({ mb }: Props) {
  return (
    <Box
      width="100%"
      height="1px"
      bg="var(--theme-divider)"
      flexShrink={0}
      mb={mb}
    />
  );
}
