import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  useProductContext,
  StackBarChart,
  Select,
  Text,
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
      // jqli userdan al
      const jql = `project = ${projectKey} AND statusCategory != Done`;
      const response = await requestJira(`/rest/api/3/search?jql=${encodeURIComponent(jql)}`);

      if (!response.ok) {
        throw new Error(`Error fetching issues: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // console.log(data);
      return data.issues;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};

const Chart = ({ objectAttr, projectKey, categorizeBy }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const extractData = async () => {
      const issues = await FetchOpenIssues(projectKey);
      // console.log(issues);
      const tempData = [];

      // TODO: secilen fieldin issuelarda karsiligi olmazsa chart re-render edilmiyor ve eski datayi gosteriyor
      if (issues !== undefined && categorizeBy !== undefined) {
        for (let i = 0; i < issues.length; i++) {
          // categorize by array element (such as labels)
          if (Array.isArray(issues[i].fields[categorizeBy])) {
            // console.log('categorizing by array element');
            for (let j = 0; j < issues[i].fields[categorizeBy].length; j++) {
              tempData.push([issues[i].fields.created.split('T')[0], 1, issues[i].fields[categorizeBy][j]]);
            }
          }
          // categorize by string or number
          else if (typeof issues[i].fields[categorizeBy] === 'string' || typeof issues[i].fields[categorizeBy] === 'number'
            || typeof issues[i].fields[categorizeBy] === 'boolean') {
            // console.log('categorizing by string or number or boolean');
            // console.log(issues[i].fields[categorizeBy]);

            tempData.push([issues[i].fields.created.split('T')[0], 1, issues[i].fields[categorizeBy]]);
          }
          else if (typeof issues[i].fields[categorizeBy] === 'object' && issues[i].fields[categorizeBy]) {
            // console.log('categorizing by object value');
            // console.log(issues[i].fields[categorizeBy]);

            tempData.push([issues[i].fields.created.split('T')[0], 1, issues[i].fields[categorizeBy].name]);
          }
        }
      }
      setChartData(tempData);
    };

    extractData();
  }, [projectKey, categorizeBy]);

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
      placeholder="Select Project"
      options={options}
      onChange={(e) => props.selectionHandler(e.value)}
    />
  );
};

const SelectFields = ({ selectionHandler }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await requestJira(`/rest/api/3/field`, {
          headers: {
            "Accept": "application/json",
          },
        });

        const data = await response.json();
        setFields(data);
      } catch (error) {
        console.error("Error fetching fields:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  if (loading) {
    return <Text>Loading fields...</Text>;
  }

  const options = fields.map(field => ({
    label: field.name,
    value: field.key,
  }));

  // console.log(options);

  return (
    <>
      <Select
        appearance="default"
        label="Select Field"
        placeholder="Categorize by"
        options={options}
        onChange={(e) => selectionHandler(e.value)}
      />
    </>
  );
};

const App = () => {
  // const context = useProductContext();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedField, setSelectedField] = useState();

  return (
    <>
      <Projects selectionHandler={setSelectedProject} />
      <SelectFields selectionHandler={setSelectedField} />
      <Chart projectKey={selectedProject} categorizeBy={selectedField} />
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);