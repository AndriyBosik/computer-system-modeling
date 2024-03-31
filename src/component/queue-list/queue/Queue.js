import React from "react";
import "./Queue.css";

export const Queue = ({
    items,
    mapHint,
    hint,
    title,
    modelable = false,
    onModelQueue = () => {}
}) => {
    const drawComponent = (item, index, arr) => {
        return (
            <React.Fragment key={index}>
                <div className="task s-vflex-center">
                    {
                        mapHint == null ? null : (
                            <div className="hint tooltipped" data-position="top" data-tooltip={hint}>
                                {mapHint(item)}
                            </div>
                        )
                    }
                    <div className="wrapper full-width s-vflex-center">
                        {item.vertex + 1}
                    </div>
                </div>
                {
                    index + 1 < arr.length ? (
                        <div className="task-separator s-vflex-center">
                            <i className="material-icons">arrow_forward</i>
                        </div>
                    ) : null
                }
            </React.Fragment>
        );
    }

    const handleModelClick = event => {
        event.preventDefault();
        onModelQueue(items);
    }

    return (
        <div className="Queue s-vflex">
            <h5>{title}</h5>
            <div className="s-hflex list">
                {
                    modelable ? (
                        <div className="model s-vflex-center">
                            <i className="material-icons tooltipped" data-position="top" data-tooltip="Start modeling" onClick={handleModelClick}>play_arrow</i>
                        </div>
                    ) : null
                }
                {
                    items.map(drawComponent)
                }
            </div>
        </div>
    )
}
