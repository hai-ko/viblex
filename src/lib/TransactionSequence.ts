import * as R from 'ramda';

export interface Action {
    callType: string;
    from: string;
    gas: string;
    input: string;
    to: string;
    value: string;
}

export interface ReplayTransaction {
    action: Action;
    result: {
        gasUsed: string;
        output: string;
    };
    subtraces: number;
    traceAddress: number[];
    type: string;
}

export function getAllAcccountAddresses(trace: ReplayTransaction[]): string[] {
    return R.pipe(
        R.map((replayTx: ReplayTransaction) => [
            replayTx.action.from,
            replayTx.action.to,
        ]),
        R.unnest,
        R.uniq,
    )(trace);
}
