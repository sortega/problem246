export type Triple = readonly [number, number, number]

/** A triple the user tested during the experiment, with the answer they got. */
export interface Probe {
  triple: Triple
  awesome: boolean
  reason?: string
}

export const START: Triple = [2, 4, 6]

export const key = (t: Triple): string => t.join(',')

export const format = (t: Triple): string => t.join(', ')
