import { useParams } from 'react-router-dom';

const ArtifactPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Artifact {id}</h1>
    </div>
  );
};

export default ArtifactPage;
