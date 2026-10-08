import { fieldDividerClasses } from '../config/playground.config.ts'
import type { ToggleRowProps } from '../Types/playground.types.ts'

export function ToggleRow({
    checked,
    description,
    label,
    onChange,
}: ToggleRowProps) {
    return (
        <label
            className={`flex cursor-pointer items-center justify-between gap-3.5 py-[18px] ${fieldDividerClasses}`}
        >
            <span className="text-[0.78rem] font-bold tracking-[0.025em]">
                {label}
                <small className="mt-0.5 block text-[0.68rem] leading-[1.35] font-medium text-[#5f7280] dark:text-bench-steel">
                    {description}
                </small>
            </span>
            <input
                className="h-[19px] w-[19px] shrink-0 accent-bench-teal"
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
        </label>
    )
}
