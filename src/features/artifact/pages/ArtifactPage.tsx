import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDepartments } from '@/features/gallery/hooks/useDepartments';
import RelatedWorksGrid from '../components/RelatedWorksGrid';
import { useArtifactDetail } from '../hooks/useArtifactDetail';
import { useRelatedWorkIds } from '../hooks/useRelatedWorkIds';
import {
  getRelatedWorksReadiness,
  RELATED_PERIOD_RADIUS,
} from '../lib/relatedWorks';
import styles from './ArtifactPage.module.css';

type HeroImageProps = {
  small: string | null;
  large: string | null;
  styles: Record<string, string>;
};

const HeroImage = ({ small, large, styles }: HeroImageProps) => {
  const [hiResLoaded, setHiResLoaded] = useState(false);
  const onLoad = useCallback(() => setHiResLoaded(true), []);

  const hasAny = large || small;
  if (!hasAny) {
    return (
      <div className={styles.hero}>
        <div className={styles.heroPlaceholder} role="img" aria-label="No image available">
          No image available
        </div>
      </div>
    );
  }

  const showSmallFirst = !!large && !!small && !hiResLoaded;

  return (
    <div className={styles.hero}>
      {showSmallFirst && (
        <img src={small} alt="" className={styles.heroImg} />
      )}
      <img
        src={(large || small)!}
        alt=""
        className={styles.heroImg}
        onLoad={large ? onLoad : undefined}
        style={showSmallFirst ? { position: 'absolute', opacity: 0, pointerEvents: 'none' } : undefined}
      />
    </div>
  );
};

const ArtifactPage = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const location = useLocation();
  const backTo =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? ((location.state as { from: string }).from || '/')
      : '/';
  const objectId = idParam != null ? Number.parseInt(idParam, 10) : Number.NaN;
  const validId = Number.isFinite(objectId) && objectId > 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [objectId]);

  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
  } = useArtifactDetail(validId ? objectId : undefined);

  const { data: departments, isPending: departmentsLoading } = useDepartments();

  const readiness = useMemo(
    () => getRelatedWorksReadiness(validId ? (detail ?? null) : null, departments),
    [validId, detail, departments]
  );

  const { data: relatedIds = [], isLoading: relatedIdsLoading, isError: relatedIdsError } =
    useRelatedWorkIds({
      artifactId: validId ? objectId : 0,
      detail: validId ? (detail ?? null) : null,
      departments,
    });

  if (!validId) {
    return (
      <div className={styles.page}>
        <nav className={styles.nav}>
          <Link to={backTo} className={styles.back}>
            ← Research gallery
          </Link>
        </nav>
        <p className={styles.alert} role="alert">
          This URL does not contain a valid object id.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to={backTo} className={styles.back}>
          ← Research gallery
        </Link>
      </nav>

      {isPending && <p className={styles.message}>Loading artifact…</p>}

      {isError && (
        <div className={styles.alert} role="alert">
          <p>
            {error instanceof Error
              ? error.message
              : 'Something went wrong while loading this object.'}
          </p>
          <button type="button" className={styles.retry} onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      {!isPending && !isError && detail == null && (
        <p className={styles.message}>
          The museum could not supply a displayable record for this id.
        </p>
      )}

      {detail && (
        <article className={styles.article}>
          <HeroImage
            key={detail.id}
            small={detail.imageUrl}
            large={detail.primaryImageLarge}
            styles={styles}
          />

          <div className={styles.body}>
            <header className={styles.header}>
              <h1 className={styles.title}>{detail.title}</h1>
              <p className={styles.lede}>
                <span>{detail.artist}</span>
                <span className={styles.dot} aria-hidden>
                  ·
                </span>
                <span>{detail.dateLine}</span>
              </p>
              {detail.objectUrl ? (
                <a
                  href={detail.objectUrl}
                  className={styles.external}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View on The Met website
                </a>
              ) : null}
            </header>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Accession number</dt>
                <dd>{detail.accessionNumber}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Medium</dt>
                <dd>{detail.medium}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Dimensions</dt>
                <dd>{detail.dimensions}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Department</dt>
                <dd>{detail.department}</dd>
              </div>
              {detail.culture !== 'Unknown' ? (
                <div className={styles.fact}>
                  <dt>Culture</dt>
                  <dd>{detail.culture}</dd>
                </div>
              ) : null}
              {detail.period !== 'Unknown' ? (
                <div className={styles.fact}>
                  <dt>Period</dt>
                  <dd>{detail.period}</dd>
                </div>
              ) : null}
            </dl>

            <section className={styles.creditSection} aria-labelledby="credit-heading">
              <h2 id="credit-heading" className={styles.sectionTitle}>
                Credit line
              </h2>
              <p className={styles.credit}>{detail.creditLine}</p>
            </section>

            <section className={styles.tagsSection} aria-labelledby="tags-heading">
              <h2 id="tags-heading" className={styles.sectionTitle}>
                Tags
              </h2>
              {detail.tags.length > 0 ? (
                <ul className={styles.tagList} role="list">
                  {detail.tags.map((t) => (
                    <li key={t} className={styles.tag}>
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>
                  No tags are listed for this object in the collection API.
                </p>
              )}
            </section>

            <section className={styles.relatedSection} aria-labelledby="related-heading">
              <h2 id="related-heading" className={styles.sectionTitle}>
                Related works
              </h2>
              <p className={styles.relatedExplainer}>
                Suggestions share the same department and an approximate ±
                {RELATED_PERIOD_RADIUS} year window derived from catalog dates
                (begin, end, or parsed display date).
              </p>

              {departmentsLoading ? (
                <p className={styles.muted}>Loading department directory…</p>
              ) : null}

              {!departmentsLoading && readiness.status === 'no-department' ? (
                <p className={styles.muted}>
                  This record’s department label does not match the museum directory, so
                  automatic neighbors are turned off.
                </p>
              ) : null}

              {!departmentsLoading && readiness.status === 'no-date' ? (
                <p className={styles.muted}>
                  There is not enough structured date information to define a period
                  window for suggestions.
                </p>
              ) : null}

              {readiness.status === 'ok' && relatedIdsError ? (
                <p className={styles.muted} role="alert">
                  Related works could not be loaded.
                </p>
              ) : null}

              {readiness.status === 'ok' && relatedIdsLoading ? (
                <p className={styles.muted}>Searching the collection…</p>
              ) : null}

              {readiness.status === 'ok' &&
              !relatedIdsLoading &&
              !relatedIdsError &&
              relatedIds.length === 0 ? (
                <p className={styles.muted}>
                  No other works in this department fall within the computed date window.
                </p>
              ) : null}

              {readiness.status === 'ok' &&
              relatedIds.length > 0 &&
              !relatedIdsLoading ? (
                <RelatedWorksGrid ids={relatedIds} />
              ) : null}
            </section>
          </div>
        </article>
      )}
    </div>
  );
};

export default ArtifactPage;
