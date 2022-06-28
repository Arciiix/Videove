import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import ReactGridLayout from "react-grid-layout";
import { useRecoilState, useRecoilValue } from "recoil";
import isEditingDashboardState from "../../../recoil/is-editing-dashboard";
import isSmallLayoutState from "../../../recoil/is-small-layout";
import layoutState from "../../../recoil/layout";
import { IMedia, MediaTypes } from "../../../types/Media.type";
import { IProject } from "../../../types/Project.type";
import Feed from "../../Feed/Feed";

interface IMainGridProps {
  media: IMedia[];
  project: IProject;
}

function MainGrid({ media, project }: IMainGridProps) {
  const [layoutEditTime, setLayoutEditTime] = useState<number>(
    new Date().getTime()
  );
  const [layout, setLayout] = useRecoilState(layoutState);
  const isSmallLayout = useRecoilValue(isSmallLayoutState);
  const [width, setWidth] = useState(0);

  const isEditingLayout = useRecoilValue(isEditingDashboardState);
  const calculateLayout = useCallback(
    (width: number) => {
      const newLayout: ReactGridLayout.Layout[] = [];
      media.forEach((media, index) => {
        newLayout.push({
          i: `feed-${index}-${media.number}-${media.type}`,
          x: index % Math.floor(width / (isSmallLayout ? 200 : 400)),
          y: Math.floor(
            index / Math.floor(width / (isSmallLayout ? 200 : 400))
          ),
          w: 1,
          h: 1,
        });
      });

      console.log("Calculated layout");

      setLayout(newLayout);
    },
    [media, width, isSmallLayout]
  );

  const renderMedia = useMemo((): JSX.Element[] => {
    let mediaArr: JSX.Element[] = [];

    mediaArr.push(
      ...media.map((m: IMedia, index): JSX.Element => {
        return (
          <div key={`feed-${index}-${m.number}-${m.type}`}>
            <Feed
              data={m}
              width={
                m.type.toString() === "AUDIO"
                  ? "1px"
                  : isSmallLayout
                  ? "200px"
                  : "400px"
              }
              height={
                m.type.toString() === "AUDIO"
                  ? "1px"
                  : isSmallLayout
                  ? "125px"
                  : "250px"
              }
              projectId={project.id as string}
            />
          </div>
        );
      })
    );

    return mediaArr;
  }, [media, isSmallLayout, project]);

  useEffect(() => {
    setLayoutEditTime(new Date().getTime());
  }, [isEditingLayout]);

  const handleResize = (): number => {
    setWidth(window.innerWidth);
    return window.innerWidth;
  };

  //TODO: Ask user if the layout should be responsive (function below)
  //   useEffect(() => {
  //     calculateLayout(width);
  //   }, [width]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    const width = handleResize();
    console.log(layout);
    if (!layout) {
      calculateLayout(width);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  console.log("layout", layout);

  console.log("is editing: ", isEditingLayout);
  return (
    <ReactGridLayout
      key={`grid-${layoutEditTime}`}
      isDraggable={isEditingLayout}
      isDroppable={isEditingLayout}
      className="mainGrid"
      layout={layout}
      cols={Math.floor(width / (isSmallLayout ? 200 : 400))}
      rowHeight={isSmallLayout ? 250 : 350}
      width={width}
      onLayoutChange={(layout) => {
        if (!isEditingLayout) {
          return;
        }
        setLayout(layout);
      }}
    >
      {renderMedia}
    </ReactGridLayout>
  );
}

export default MainGrid;
