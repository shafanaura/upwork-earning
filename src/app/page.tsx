"use client";

import { BarChart } from "@mantine/charts";
import {
  Anchor,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  Paper,
  rem,
  Stack,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconMoonStars,
  IconSun,
  IconUpload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import Link from "next/link";
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
  // Sort the data first by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = dayjs(a.Date);
    const dateB = dayjs(b.Date);
    return dateA.valueOf() - dateB.valueOf();
  });

  const groupedData = sortedData.reduce((acc, row) => {
    const date = dayjs(row.Date);
    if (!date.isValid()) return acc;

    const month = date.format("YYYY-MM");
    const amount = parseFloat(row.Amount) || 0;

    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and ensure proper sorting
  const monthArray = Object.entries(groupedData)
    .map(([month, earn]) => {
      const date = dayjs(`${month}-01`);
      return {
        month: date.format("MMMM YYYY"),
        earn,
      };
    })
    .sort((a, b) => {
      const [yearA, monthA] = a.month.split("-").map(Number);
      const [yearB, monthB] = b.month.split("-").map(Number);

      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthA - monthB;
    });

  return monthArray;
};

const App = () => {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
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
        const groupedData = groupByMonth(data);
        setChartData(groupedData);
        const total = groupedData.reduce((sum, item) => sum + item.earn, 0);
        setTotalEarnings(total);
      },
    });
  };

  useEffect(() => {
    if (file) {
      calculateEarnings();
    }
  }, [file]);

  // Handle drag-and-drop file upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  return (
    <Container size="lg" pt={100} pb="xl" mih="100vh">
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
            Upload your CSV file to visualize monthly revenue trends.
          </Text>

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
                    ? theme.colors.dark[7]
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
              dataKey="month"
              series={[
                {
                  name: "earn",
                  label: "Earning:",
                  color:
                    colorScheme === "dark" ? colors.green[4] : colors.green[7],
                },
              ]}
              valueFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value)
              }
              withBarValueLabel
              valueLabelProps={{
                position: "top",
                fill: colorScheme === "dark" ? colors.dark[0] : colors.dark[7],
                fontWeight: 500,
                fontSize: 14,
              }}
              xAxisProps={{
                angle: -45,
                textAnchor: "end",
                fontSize: 12,
                fill: colorScheme === "dark" ? colors.dark[0] : colors.dark[7],
                height: 50,
              }}
            />
          )}
        </Stack>
      </Card>
      <Anchor
        component={Link}
        href="https://github.com/shafanaura/upwork-earning"
        target="_blank"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "end",
        }}
      >
        <IconBrandGithub />
        <p>Source Code</p>
      </Anchor>
    </Container>
  );
};

export default App;
