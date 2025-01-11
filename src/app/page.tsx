"use client";

import { BarChart } from "@mantine/charts";
import {
  Button,
  Card,
  Container,
  FileButton,
  Group,
  Paper,
  rem,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMoonStars, IconSun, IconUpload } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

interface IChartData {
  earn: number;
  [key: string]: string | number;
}

const groupByMonth = (data: Array<{ Date: string; Amount: string }>) => {
  const groupedData = data.reduce((acc, row) => {
    const date = dayjs(row.Date);
    if (!date.isValid()) return acc;

    const month = date.format("YYYY-MM");
    const amount = parseFloat(row.Amount) || 0;

    acc[month] = (acc[month] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groupedData).map(([month, earn]) => ({
    month,
    earn,
  }));
};

const groupByWeek = (data: Array<{ Date: string; Amount: string }>) => {
  const groupedData = data.reduce((acc, row) => {
    const date = dayjs(row.Date);
    if (!date.isValid()) return acc;

    const year = date.year();
    const month = date.month() + 1; // Months are 0-based in dayjs
    const week = date.isoWeek(); // ISO week number
    const key = `${year}-${String(month).padStart(2, "0")}-WEEK-${week}`; // Format: 2024-02-WEEK-1

    const amount = parseFloat(row.Amount) || 0;

    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groupedData).map(([week, earn]) => ({
    week,
    earn,
  }));
};

const App = () => {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [file, setFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState<IChartData[]>([]);

  const { colors } = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  const calculateEarnings = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as Array<{ Date: string; Amount: string }>;
        const groupedData =
          viewMode === "monthly" ? groupByMonth(data) : groupByWeek(data);

        const labels = Object.keys(groupedData).sort();
        const amounts = labels.map((label) => groupedData[label]);
        setChartData(amounts);

        const total = amounts
          .map((item) => item.earn)
          .reduce((sum, amount) => sum + amount, 0);
        setTotalEarnings(total);
      },
    });
  };

  useEffect(() => {
    if (file) {
      calculateEarnings();
    }
  }, [file, viewMode]);

  // Handle drag-and-drop file upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  return (
    <Container size="xl" pt={100} pb="xl" mih="100vh">
      <Card
        shadow="xl"
        padding="xl"
        radius="lg"
        sx={(theme) => ({
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[1],
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
        })}
      >
        <Stack gap="lg">
          <Group justify="center">
            <Title order={2} ta="center" style={{ fontWeight: 700 }}>
              Revenue Visualizer
            </Title>
            <Switch
              size="xl"
              color="dark.4"
              checked={colorScheme === "dark"}
              onChange={(e) =>
                setColorScheme(e.target.checked ? "dark" : "light")
              }
              onLabel={
                <IconSun
                  style={{ width: rem(20), height: rem(20) }}
                  stroke={2.5}
                  color={colors.yellow[4]}
                />
              }
              offLabel={
                <IconMoonStars
                  style={{ width: rem(20), height: rem(20) }}
                  stroke={2.5}
                  color={colors.blue[6]}
                />
              }
            />
          </Group>
          <Text ta="center" color="dimmed" size="lg">
            Upload your CSV file to visualize monthly or weekly revenue trends.
          </Text>

          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: "Monthly", value: "monthly" },
              { label: "Weekly", value: "weekly" },
            ]}
            maw={300}
          />

          <Paper
            {...getRootProps()}
            radius="md"
            sx={(theme) => ({
              border: "2px dashed",
              borderColor: theme.colors.teal[7],
              padding: "40px 0",
              textAlign: "center",
              backgroundColor:
                colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0],
              cursor: "pointer",
              transition: "background-color 0.3s ease-in-out",
              "&:hover": {
                backgroundColor:
                  colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[2],
              },
            })}
          >
            <input {...getInputProps()} />
            <Text c="gray" size="lg" mb="xs">
              Drag and drop your CSV file here or click to select
            </Text>
            <IconUpload
              size={40}
              color={colorScheme === "dark" ? "white" : colors.dark[9]}
            />
          </Paper>
          <Text ta="center" c="gray">
            or
          </Text>
          <FileButton accept=".csv" onChange={(file) => setFile(file)}>
            {(props) => (
              <Button
                {...props}
                size="lg"
                fullWidth
                variant="gradient"
                gradient={{ from: "teal", to: "lime" }}
                style={{ marginBottom: 30 }}
              >
                Click to upload CSV
              </Button>
            )}
          </FileButton>

          {totalEarnings !== null && (
            <Text
              ta="center"
              fw={700}
              size="xl"
              sx={(theme) => ({
                fontSize: "24px",
                color:
                  colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.dark[7],
                textShadow: "1px 1px 5px rgba(0, 0, 0, 0.1)",
              })}
            >
              Total Earnings: ${totalEarnings.toLocaleString()}
            </Text>
          )}

          {chartData?.length > 0 && (
            <BarChart
              h={300}
              data={chartData}
              dataKey={viewMode === "monthly" ? "month" : "week"}
              series={[
                {
                  name: "earn",
                  color:
                    colorScheme === "dark" ? colors.green[4] : colors.green[7],
                },
              ]}
              tickLine="y"
              valueFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value)
              }
              withBarValueLabel
              valueLabelProps={{
                position: "top",
                fill: colorScheme === "dark" ? colors.dark[0] : colors.dark[6],
                fontWeight: 500,
                fontSize: 14,
              }}
            />
          )}
        </Stack>
      </Card>
    </Container>
  );
};

export default App;
