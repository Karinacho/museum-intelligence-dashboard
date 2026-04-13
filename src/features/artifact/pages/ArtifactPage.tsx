import { ArtifactInvalidObjectId } from '../components/ArtifactInvalidObjectId/ArtifactInvalidObjectId';
import { useArtifactPageParams } from '../hooks/useArtifactPageParams';
import { ArtifactDetailPage } from './ArtifactDetailPage/ArtifactDetailPage';

const ArtifactPage = () => {
  const { objectId, validId, backTo } = useArtifactPageParams();

  if (!validId) {
    return <ArtifactInvalidObjectId backTo={backTo} />;
  }

  return <ArtifactDetailPage objectId={objectId} backTo={backTo} />;
};

export default ArtifactPage;
