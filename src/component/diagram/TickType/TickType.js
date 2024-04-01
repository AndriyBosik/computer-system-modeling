import "./TickType.css";
import { TICK_TYPE } from "../../../metadata/const";
import { toStr } from "../../../handler/debug";
import { useState } from "react";

export const TickType = ({
    primaryTick,
    secondaryTick
}) => {
    const [currentView, setCurrentView] = useState("primary");

    const getContent = tick => {
        if (tick.type == TICK_TYPE.PROCESSOR) {
            return tick.details.title;
        } else if (tick.type == TICK_TYPE.READ) {
            return `R[${tick.details.task}]`;
        } else if (tick.type == TICK_TYPE.WRITE) {
            return `W[${tick.details.task}]`;
        } else if (tick.type == TICK_TYPE.TRANSFER) {
            return `T[${tick.details.parentTask + 1}-${tick.details.childTask + 1}]{${tick.details.nextHop + 1}}`;
        } else if (tick.type == TICK_TYPE.RUN) {
            return `R[${tick.details.task + 1}]`;
        } else if (tick.type == TICK_TYPE.WAITING) {
            return `W[${tick.details.task + 1}]`;
        }
        return null;
    }

    const processor = primaryTick.type == TICK_TYPE.PROCESSOR;
    const hasSecondary = !processor && secondaryTick.type != TICK_TYPE.EMPTY;
    const primaryContent = getContent(primaryTick);

    const handleClick = event => {
        event.preventDefault();
        if (hasSecondary) {
            setCurrentView(previous => previous == "primary" ? "secondary" : "primary");
        }
    }

    return (
        <div className={`TickType s-vflex-center ${currentView == "primary" ? primaryTick.type : secondaryTick.type} ${hasSecondary ? "secondary" : ""}`} onClick={handleClick}>
            {currentView == "primary" ? primaryContent : getContent(secondaryTick)}
        </div>
    );
}