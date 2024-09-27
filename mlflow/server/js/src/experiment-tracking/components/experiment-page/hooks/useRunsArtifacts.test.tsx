import { listArtifactsApi } from '../../../actions';
import { useRunsArtifacts } from './useRunsArtifacts';
import { ArtifactListFilesResponse } from '../../../types';
import { renderHook, cleanup, waitFor } from '@testing-library/react-for-react-18';

const mockArtifactsData: Record<string, ArtifactListFilesResponse> = {
  'run-1': {
    root_uri: 'run-1',
    files: [
      {
        path: 'artifact1.txt',
        is_dir: false,
        file_size: 300,
      },
    ],
  },
  'run-2': {
    root_uri: 'run-2',
    files: [
      {
        path: 'artifact2.txt',
        is_dir: false,
        file_size: 300,
      },
    ],
  },
};

jest.mock('../../../actions', () => ({
  ...jest.requireActual('../../../actions'),
  listArtifactsApi: jest.fn((runUuid: string) => {
    return {
      payload: mockArtifactsData[runUuid],
    };
  }),
}));

describe('useRunsArtifacts', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  test('fetches artifacts for given run UUIDs', async () => {
    const runUuids = ['run-1', 'run-2'];
    const { result } = renderHook(() => useRunsArtifacts(runUuids));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Make sure API is called correctly
    expect(listArtifactsApi).toHaveBeenCalledWith('run-1');
    expect(listArtifactsApi).toHaveBeenCalledWith('run-2');
    expect(listArtifactsApi).toHaveBeenCalledTimes(2);

    expect(result.current.artifactsKeyedByRun).toEqual(mockArtifactsData);
  });
});
