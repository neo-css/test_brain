import { describe, expect, it } from 'vitest';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';

describe('versionSource compatibility', () => {
  it('exports no static runtime collection from mock fixtures', async () => {
    const source = await import('./versionSource');

    expect('mockServiceVersions' in source).toBe(false);
    expect('findVersionByPatchId' in source).toBe(false);
    expect(typeof mapPatchScoreToVersionDetail).toBe('function');
  });
});
