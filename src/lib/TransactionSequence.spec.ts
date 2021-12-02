import { getAllAcccountAddresses } from './TransactionSequence';
import { Trace } from '../../test/test-data/Trace';

describe('TransactionSequence', () => {
    test('getAllAcccountAddresses', async () => {
        expect(getAllAcccountAddresses(Trace.result.trace)).toEqual([
            '0x2b263f55bf2125159ce8ec2bb575c649f822ab46',
            '0x961143f73f3f18d15043210134edf2f08aa6a6f7',
            '0x5fc8a17dded0a4da0f9a1e44e6c26f80aa514145',
            '0x90e978eaec76291fcda3c727d022c3589d74be43',
            '0x9d7c436db65ad7a02bb03ca727d027bd34789958',
            '0xb124190942976431d8181fbe183e44584253da68',
            '0xfbf2310fefbe2f8969c58675406db2257ee66733',
            '0x8fd3d838ffceeb4ff4dd5b0221a99c3b1ddb9ac9',
            '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
            '0x0baba1ad5be3a5c0a66e7ac838a129bf948f1ea4',
            '0x3c294fcf74129d649325f8995afc2f9cfafab9da',
            '0x674bdf20a0f284d710bc40872100128e2d66bd3f',
            '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
        ]);
    });
});
