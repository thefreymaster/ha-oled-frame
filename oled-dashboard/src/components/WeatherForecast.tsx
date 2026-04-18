import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltPartlyCloudy,
  WiCloudy,
  WiFog,
  WiHail,
  WiLightning,
  WiThunderstorm,
  WiNightAltThunderstorm,
  WiRain,
  WiShowers,
  WiNightAltShowers,
  WiSnow,
  WiNightAltSnow,
  WiRainMix,
  WiStrongWind,
  WiNa,
} from "react-icons/wi";

type IconComponent = React.ComponentType<{
  size?: string | number;
  color?: string;
}>;

const DAY_ICONS: Record<string, IconComponent> = {
  sunny: WiDaySunny,
  "clear-night": WiNightClear,
  partlycloudy: WiDayCloudy,
  cloudy: WiCloudy,
  fog: WiFog,
  hail: WiHail,
  lightning: WiLightning,
  "lightning-rainy": WiThunderstorm,
  pouring: WiRain,
  rainy: WiShowers,
  snowy: WiSnow,
  "snowy-rainy": WiRainMix,
  windy: WiStrongWind,
  "windy-variant": WiStrongWind,
  exceptional: WiNa,
};

const NIGHT_ICONS: Record<string, IconComponent> = {
  ...DAY_ICONS,
  sunny: WiNightClear,
  partlycloudy: WiNightAltPartlyCloudy,
  "lightning-rainy": WiNightAltThunderstorm,
  rainy: WiNightAltShowers,
  snowy: WiNightAltSnow,
};

function isNight(datetime: string) {
  const h = new Date(datetime).getHours();
  return h >= 20 || h < 6;
}

function getIcon(condition: string, datetime: string): IconComponent {
  const map = isNight(datetime) ? NIGHT_ICONS : DAY_ICONS;
  return map[condition] ?? WiNa;
}

function formatHour(datetime: string) {
  const d = new Date(datetime);
  const h = d.getHours();
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

interface ForecastItem {
  datetime: string;
  temperature: number | null;
  condition: string | null;
  precipitationProbability: number | null;
}

interface Props {
  forecast: ForecastItem[];
  count?: number;
}

export function WeatherForecast({ forecast, count = 5 }: Props) {
  const periods = forecast.slice(0, count);

  return (
    <Box width="100%" px="2vmin">
      <HStack gap={0} justify="space-between" align="stretch">
        {periods.map((period, i) => (
          <VStack
            key={i}
            gap="1vmin"
            align="center"
            flex={1}
            opacity={i === 0 ? 1 : 0.65}
            py="2vmin"
          >
            <Text
              fontSize="2.8vmin"
              color="var(--theme-fg-dim)"
              letterSpacing="0.05em"
            >
              {formatHour(period.datetime)}
            </Text>
            <Box
              fontSize="7vmin"
              lineHeight="1"
              color="var(--theme-fg-dim)"
              opacity={0.85}
            >
              {(() => {
                const Icon = getIcon(period.condition ?? "", period.datetime);
                return <Icon size="1em" />;
              })()}
            </Box>
            <Text
              fontSize="4.5vmin"
              color="var(--theme-fg-dim)"
              fontWeight="300"
            >
              {period.temperature != null
                ? `${Math.round(period.temperature)}°`
                : "—"}
            </Text>
            {period.precipitationProbability != null &&
            period.precipitationProbability > 0 ? (
              <Text fontSize="2.8vmin" color="blue.400">
                {period.precipitationProbability}%
              </Text>
            ) : (
              <Box height="2.8vmin" />
            )}
          </VStack>
        ))}
      </HStack>
    </Box>
  );
}
