// File: packages/app/src/scaffolder/customFields.tsx
// VERSION WITH MOCK DATA FOR TESTING

import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { useEffect, useState } from 'react';

// Mock data for testing
const MOCK_SERVERS: Record<string, Record<string, string[]>> = {
    AMM01: {
        DEV: ['DEV-SQL-01', 'DEV-SQL-02', 'DEV-SQL-03'],
        IT: ['IT-SQL-01', 'IT-SQL-02'],
        QA: ['QA-SQL-01', 'QA-SQL-02'],
        PROD: ['PROD-SQL-01', 'PROD-SQL-02', 'PROD-SQL-03'],
    },
    AMM02: {
        DEV: ['DEV-APP-01', 'DEV-APP-02'],
        IT: ['IT-APP-01'],
        QA: ['QA-APP-01', 'QA-APP-02'],
        PROD: ['PROD-APP-01', 'PROD-APP-02'],
    },
    AMM03: {
        DEV: ['DEV-WEB-01'],
        IT: ['IT-WEB-01'],
        QA: ['QA-WEB-01'],
        PROD: ['PROD-WEB-01', 'PROD-WEB-02'],
    },
};

// ============================================================================
// 1. ServerNamePicker - Filtered dropdown for server selection
// ============================================================================
export const ServerNamePickerExtension = ({
    onChange,
    rawErrors,
    required,
    formData,
    formContext,
}: FieldExtensionComponentProps<string>) => {
    const [servers, setServers] = useState<string[]>([]);

    const ammCode = formContext.formData?.ammCode;
    const environment = formContext.formData?.environment;

    useEffect(() => {
        if (!ammCode || !environment) {
            setServers([]);
            onChange(undefined as any);
            return;
        }

        // Use mock data
        const serverList = MOCK_SERVERS[ammCode]?.[environment] || [];
        setServers(serverList);

        // Clear selection if current value is not in new list
        if (formData && !serverList.includes(formData)) {
            onChange(undefined as any);
        }
    }, [ammCode, environment, formData, onChange]);

    return (
        <FormControl
            margin="normal"
            required={required}
            error={rawErrors?.length > 0}
            fullWidth
        >
            <InputLabel>Server Name</InputLabel>
            <Select
                value={formData || ''}
                onChange={e => onChange(e.target.value as string)}
                disabled={!ammCode || !environment}
            >
                {!ammCode || !environment ? (
                    <MenuItem value="">Select AMM Code and Environment first</MenuItem>
                ) : servers.length === 0 ? (
                    <MenuItem value="">No servers available</MenuItem>
                ) : (
                    servers.map(server => (
                        <MenuItem key={server} value={server}>
                            {server}
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    );
};

// ============================================================================
// 2. InstanceNameGenerator - Auto-generate instance name
// ============================================================================
export const InstanceNameGeneratorExtension = ({
    onChange,
    formData,
    formContext,
}: FieldExtensionComponentProps<string>) => {
    const ammCode = formContext.formData?.ammCode;
    const environment = formContext.formData?.environment;

    useEffect(() => {
        if (!ammCode || !environment) {
            onChange('');
            return;
        }

        // Environment letter mapping
        const envLetterMap: Record<string, string> = {
            DEV: 'D',
            IT: 'R',
            QA: 'Q',
            PROD: 'P',
        };

        const envLetter = envLetterMap[environment] || 'X';
        const typeLetter = 'D'; // Database (default)

        // Mock progressive number (always 1 for now)
        const progressiveNumber = 1;

        const name = `SQL${ammCode}${envLetter}${typeLetter}${progressiveNumber}`;
        onChange(name);
    }, [ammCode, environment, onChange]);

    return (
        <TextField
            label="Instance Name (Auto-generated)"
            value={formData || ''}
            fullWidth
            margin="normal"
            disabled
            InputProps={{
                readOnly: true,
            }}
        />
    );
};

// ============================================================================
// 3. SqlEditionPicker - Edition dropdown with version/environment rules
// ============================================================================
export const SqlEditionPickerExtension = ({
    onChange,
    rawErrors,
    required,
    formData,
    formContext,
}: FieldExtensionComponentProps<string>) => {
    const [editions, setEditions] = useState<string[]>([]);

    const sqlVersion = formContext.formData?.sqlVersion;
    const environment = formContext.formData?.environment;

    useEffect(() => {
        if (!sqlVersion || !environment) {
            setEditions([]);
            return;
        }

        let availableEditions: string[] = [];

        // Base editions by version
        if (['2016', '2019', '2022'].includes(sqlVersion)) {
            availableEditions = ['Developer', 'Standard', 'Enterprise'];
        } else if (sqlVersion === '2025') {
            availableEditions = ['Developer Standard', 'Developer Enterprise', 'Standard', 'Enterprise'];
        }

        // Apply environment constraints
        if (environment === 'PROD') {
            // Remove Developer editions for production
            availableEditions = availableEditions.filter(
                ed => !ed.startsWith('Developer')
            );
        } else if (environment === 'DEV') {
            // Remove non-Developer Enterprise editions for dev
            availableEditions = availableEditions.filter(
                ed => ed.includes('Developer') || ed === 'Standard'
            );
        }

        setEditions(availableEditions);

        // Set default value if none selected
        if (availableEditions.length > 0 && !formData) {
            if (environment === 'DEV') {
                const defaultEdition = sqlVersion === '2025' ? 'Developer Enterprise' : 'Developer';
                if (availableEditions.includes(defaultEdition)) {
                    onChange(defaultEdition);
                }
            } else if (environment === 'PROD') {
                if (availableEditions.includes('Enterprise')) {
                    onChange('Enterprise');
                }
            }
        } else if (formData && !availableEditions.includes(formData)) {
            // Clear selection if current value is not valid
            onChange(undefined as any);
        }
    }, [sqlVersion, environment, formData, onChange]);

    return (
        <FormControl
            margin="normal"
            required={required}
            error={rawErrors?.length > 0}
            fullWidth
        >
            <InputLabel>SQL Edition</InputLabel>
            <Select
                value={formData || ''}
                onChange={e => onChange(e.target.value as string)}
                disabled={editions.length === 0}
            >
                {editions.length === 0 ? (
                    <MenuItem value="">Select version and environment first</MenuItem>
                ) : (
                    editions.map(edition => (
                        <MenuItem key={edition} value={edition}>
                            {edition}
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    );
};