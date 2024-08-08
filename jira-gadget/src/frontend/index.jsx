import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  useProductContext,
  StackBarChart,
  Select,
} from "@forge/react";
import { requestJira, invoke } from '@forge/bridge';

function formatData(arr) {
  const res = {};

  arr.forEach(([date, count, category]) => {
    const key = `${date}-${category}`;

    if (!res[key]) {
      res[key] = [date, count, category];
    } else {
      res[key][1] += count;
    }
  });

  return Object.values(res);
}

const FetchOpenIssues = async (projectKey) => {
  if (projectKey) {
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
  }
};

const Chart = ({ projectKey }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const extractData = async () => {
      const issues = await FetchOpenIssues(projectKey);
      const tempData = [];

      for (let i = 0; i < issues.length; i++) {
        for (let j = 0; j < issues[i].fields.labels.length; j++) {
          tempData.push([issues[i].fields.created.split('T')[0], 1, issues[i].fields.labels[j]]);
        }
      }
      setChartData(tempData);
    };

    extractData();
  }, [projectKey]);

  return (
    <StackBarChart
      data={formatData(chartData)}
      xAccessor={0}
      yAccessor={1}
      colorAccessor={2}
    />
  )
};

const Projects = (props) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await invoke('fetchProjects', {});
        setProjects(projectsData);

        console.log("project fetch")
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const options = projects.map(project => ({
    label: project.name,
    value: project.key,
  }));

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
  // const context = useProductContext();
  const [selectedProject, setSelectedProject] = useState();

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
