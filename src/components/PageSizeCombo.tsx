import { ActionIcon, Combobox, TextInput, useCombobox } from '@mantine/core';
import { IconCopyX } from '@tabler/icons-react';
import { clampNumber, isUndefined, normalizeNumber } from 'nhb-toolbox';

const PAGE_SIZES = ['12', '24', '48', '96', '128'];

type Props = {
    pageSize: number;
    onChange: (value: number) => void;
};

export function PageSizeCombobox({ pageSize, onChange }: Props) {
    const combobox = useCombobox();

    const handleValue = (value: string) => {
        const parsed = normalizeNumber(value);

        if (!isUndefined(parsed)) {
            onChange(clampNumber(parsed, 10, 9999));
        }
    };

    return (
        <Combobox
            onOptionSubmit={(value) => {
                handleValue(value);
                combobox.closeDropdown();
            }}
            store={combobox}
        >
            <Combobox.Target>
                <TextInput
                    onBlur={() => combobox.closeDropdown()}
                    onChange={(event) => {
                        handleValue(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    rightSection={
                        pageSize && pageSize !== 12 ? (
                            <ActionIcon
                                onClick={() => handleValue('12')}
                                size="sm"
                                variant="subtle"
                            >
                                <IconCopyX size={16} />
                            </ActionIcon>
                        ) : null
                    }
                    size="xs"
                    value={String(pageSize)}
                    w={90}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {PAGE_SIZES.map((size) => (
                        <Combobox.Option key={size} value={size}>
                            {size}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
