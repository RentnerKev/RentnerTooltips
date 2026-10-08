import type { SignalRowProps } from '../Types/playground.types.ts'

export function SignalRow({ label, value }: SignalRowProps) {
    return (
        <div className="flex justify-between gap-4 border-b border-dotted border-[#8295a1] py-2 dark:border-[#526a7c]">
            <dt className="text-[#5f7280] dark:text-bench-steel">{label}</dt>
            <dd className="m-0 font-extrabold text-bench-teal dark:text-[#69c7df]">
                {value}
            </dd>
        </div>
    )
}
