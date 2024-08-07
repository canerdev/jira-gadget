import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  useProductContext,
  StackBarChart,
  Select,
} from "@forge/react";
import { requestJira, invoke } from '@forge/bridge';

function duzenleListe(arrayList) {
  const sonuc = {};

  arrayList.forEach(([tarih, sayi, kategori]) => {
    const key = `${tarih}-${kategori}`;

    if (!sonuc[key]) {
      sonuc[key] = [tarih, sayi, kategori];
    } else {
      sonuc[key][1] += sayi;
    }
  });

  return Object.values(sonuc);
}

const FetchOpenIssues = async (projectKey) => {
  try {
    const jql = `project = ${projectKey} AND statusCategory != Done`;
    const response = await requestJira(`/rest/api/3/search?jql=${encodeURIComponent(jql)}`);

    if (!response.ok) {
      throw new Error(`Error fetching issues: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Chart = ({ projectKey }) => {
  const [data1, setData1] = useState([]);
  console.log(projectKey);
  
  useEffect(() => {
    const extractData = async () => {
      const issues = await FetchOpenIssues(projectKey);
      const newData = [];

      for (let i = 0; i < issues.length; i++) {
        for (let j = 0; j < issues[i].fields.labels.length; j++) {
          newData.push([issues[i].fields.created.split('.')[0], 1, issues[i].fields.labels[j]]);
        }
      }

      setData1(newData);
    };

    extractData();
  }, [projectKey]);

  return (
    <StackBarChart
      data={duzenleListe(data1)}
      xAccessor={0}
      yAccessor={1}
      colorAccessor={2}
    />
  )
};

const Projects = (props) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const test = async () => {
      try {
        const projectsData = await invoke('fetchProjects', {});
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    test();
  }, []);

  console.log(projects);

  const options = projects.map(project => ({
    label: project.name,
    value: project.key,
  }));

  console.log(options);

  if (loading) {
    return <Text>Loading projects...</Text>;
  }

  return (
    <Select
      appearance="default"
      label="Select Project"
      options={options}
      onChange={(e) => props.selectionHandler(e.value)}
    />
  );
};

const App = () => {
  const context = useProductContext();
  const [selectedProject, setSelectedProject] = useState();

  if (!context) {
    return "Loading...";
  }

  return (
    <>
      <Projects selectionHandler={setSelectedProject} />
      <Chart projectKey={selectedProject} />
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
