import { useCallback, useEffect, useMemo, useState } from "react";
import ReactGridLayout from "react-grid-layout";
import { useRecoilState, useRecoilValue } from "recoil";
import isEditingDashboardState from "../../../recoil/is-editing-dashboard";
import layoutState from "../../../recoil/layout";
import { IMedia, MediaTypes } from "../../../types/Media.type";
import Feed from "../../Feed/Feed";

interface IMainGridProps {
  media: IMedia[];
}

function MainGrid({ media }: IMainGridProps) {
  const [layoutEditTime, setLayoutEditTime] = useState<number>(
    new Date().getTime()
  );
  const [layout, setLayout] = useRecoilState(layoutState);
  const [width, setWidth] = useState(0);

  const isEditingLayout = useRecoilValue(isEditingDashboardState);
  const calculateLayout = useCallback(
    (width: number) => {
      const newLayout: ReactGridLayout.Layout[] = [];
      media.forEach((media, index) => {
        newLayout.push({
          i: `feed-${index}-${media.number}-${media.type}`,
          x: index % Math.floor(width / 400),
          y: Math.floor(index / 3),
          w: 1,
          h: 1,
        });
      });

      setLayout(newLayout);
    },
    [media, width]
  );

  const renderMedia = useMemo(() => {
    return media.map((m: IMedia, index) => {
      return (
        <div key={`feed-${index}-${m.number}-${m.type}`}>
          <Feed
            data={m}
            width={m.type.toString() === "AUDIO" ? "1px" : "400px"}
            height={m.type.toString() === "AUDIO" ? "1px" : "250px"}
          />
        </div>
      );
    });
  }, [media]);

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
    calculateLayout(width);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  console.log("is editing: ", isEditingLayout);
  return (
    <ReactGridLayout
      key={`grid-${layoutEditTime}`}
      isDraggable={isEditingLayout}
      isDroppable={isEditingLayout}
      className="mainGrid"
      layout={layout}
      cols={Math.floor(width / 400)}
      rowHeight={350}
      width={width}
      onLayoutChange={(layout) => {
        setLayout(layout);
      }}
    >
      {renderMedia}
    </ReactGridLayout>
  );
}

export default MainGrid;
