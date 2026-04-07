import { Box, VStack, Text, Spinner } from "@chakra-ui/react";
import { ClockDisplay } from "../components/ClockDisplay";
import { WeatherCurrent } from "../components/WeatherCurrent";
import { WeatherForecast } from "../components/WeatherForecast";
import { EnergyPanel } from "../components/EnergyPanel";
import { useWeather } from "../hooks/useWeather";
import { useEnergy } from "../hooks/useEnergy";

export function ClockWeather() {
  const { data: weather, isError, isPending } = useWeather();
  const { data: energy, isError: energyError } = useEnergy();

  return (
    <Box
      width="100vw"
      height="100vh"
      bg="black"
      display="flex"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
      overflow="hidden"
      px="4vw"
      py="4vw"
    >
      <ClockDisplay />

      {isPending && <Spinner size="sm" color="gray.700" />}

      {isError && (
        <Text color="gray.800" fontSize="3vw">
          weather unavailable
        </Text>
      )}

      {weather && (
        <VStack gap="3vw" width="100%">
          <WeatherCurrent weather={weather} />
          <WeatherForecast forecast={weather.forecast} />
        </VStack>
      )}

      <EnergyPanel energy={energy ?? null} isError={energyError} />
    </Box>
  );
}
