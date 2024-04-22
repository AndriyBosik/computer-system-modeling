import "./TickType.css";
import { TICK_TYPE } from "../../../metadata/const";
import { useState } from "react";

export const TickType = ({
    primaryMode,
    secondaryMode,
    primaryTick,
    secondaryTick
}) => {
    const [currentView, setCurrentView] = useState("primary");

    const getContent = (tick, mode) => {
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
            return mode == "execution" 
                ? `W[${tick.details.task + 1}]` 
                : `R[${tick.details.parentTask + 1}-${tick.details.childTask + 1}]{${tick.details.parentHop + 1}}`;
        }
        return null;
    }

    const processor = primaryTick.type == TICK_TYPE.PROCESSOR;
    const hasSecondary = !processor && secondaryTick.type != TICK_TYPE.EMPTY;
    const primaryContent = getContent(primaryTick, primaryMode);

    const handleClick = event => {
        event.preventDefault();
        if (hasSecondary) {
            setCurrentView(previous => previous == "primary" ? "secondary" : "primary");
        }
    }

    return (
        <div className={`TickType s-vflex-center ${currentView == "primary" ? primaryMode : secondaryMode} ${currentView == "primary" ? primaryTick.type : secondaryTick.type} ${hasSecondary ? "secondary" : ""}`} onClick={handleClick}>
            {currentView == "primary" ? primaryContent : getContent(secondaryTick, currentView == "primary" ? primaryMode : secondaryMode)}
        </div>
    );
}