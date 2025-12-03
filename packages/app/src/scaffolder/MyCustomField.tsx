/* This component handles the Logic:
   - If Env = Prod -> No Developer Edition
   - If Env = Dev -> No Enterprise Edition
*/
import { MenuItem, Select } from '@material-ui/core';

export const DynamicSqlEditionSelector = ({ onChange, formData }: { onChange: (value: string) => void; formData: { environment: string; sqlVersion: string }; uiSchema: any }) => {
    // Access previous page data (formData is usually the current step, 
    // you may need 'useForm' context depending on Backstage version)
    const environment = formData.environment; // 'DEV' or 'PROD'
    const version = formData.sqlVersion;      // '2022', '2025'

    let options = ['Standard']; // Standard is always available [cite: 43]

    // Logic for Developer Edition 
    if (environment !== 'PROD') {
        if (version === '2025') {
            options.push('Developer Enterprise'); // [cite: 44]
        } else {
            options.push('Developer'); // [cite: 43]
        }
    }

    // Logic for Enterprise Edition 
    if (environment !== 'DEV') {
        options.push('Enterprise');
    }

    return (
        <Select onChange={(e) => onChange(e.target.value as string)}>
            {options.map(opt => <MenuItem value={opt}>{opt}</MenuItem>)}
        </Select>
    );
};