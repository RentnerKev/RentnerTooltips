import type { CSSProperties } from 'react'
import type { TooltipGeometry } from '../../../lib/Tooltip/Types/tooltip-geometry.types.ts'

export function TooltipArrow({
    position,
    className,
}: {
    position: TooltipGeometry | null
    className: string
}) {
    const side = position?.side ?? 'top'
    const vertical = side === 'top' || side === 'bottom'
    const style: CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        width: vertical ? 12 : 6,
        height: vertical ? 6 : 12,
        visibility: position?.arrowHidden ? 'hidden' : undefined,
        ...(vertical
            ? { left: position?.arrowX, transform: 'translateX(-50%)' }
            : { top: position?.arrowY, transform: 'translateY(-50%)' }),
        ...(side === 'top'
            ? { bottom: -6 }
            : side === 'bottom'
              ? { top: -6 }
              : side === 'left'
                ? { right: -6 }
                : { left: -6 }),
    }
    return (
        <span aria-hidden="true" style={style}>
            <svg
                width={12}
                height={6}
                viewBox="0 0 12 6"
                focusable="false"
                className={className}
                style={{
                    display: 'block',
                    ...(vertical
                        ? {
                              transform:
                                  side === 'bottom'
                                      ? 'rotate(180deg)'
                                      : undefined,
                          }
                        : {
                              position: 'absolute',
                              left: -3,
                              top: 3,
                              transform:
                                  side === 'left'
                                      ? 'rotate(-90deg)'
                                      : 'rotate(90deg)',
                          }),
                }}
            >
                <polygon points="0,0 12,0 6,6" />
            </svg>
        </span>
    )
}
