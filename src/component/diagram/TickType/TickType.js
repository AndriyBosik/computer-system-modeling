import "./TickType.css";
import { TICK_TYPE } from "../../../metadata/const";

export const TickType = ({
    type,
    details
}) => {
    const getContent = () => {
        if (type == TICK_TYPE.PROCESSOR) {
            return details.title;
        } else if (type == TICK_TYPE.READ) {
            return `R[${details.task}]`;
        } else if (type == TICK_TYPE.WRITE) {
            return `W[${details.task}]`;
        } else if (type == TICK_TYPE.TRANSPORT) {
            return `T[${details.parentTask}-${details.task}]{${details.processor}}`;
        } else if (type == TICK_TYPE.RUN) {
            return `R[${details.task}]`;
        }
        return null;
    }

    return (
        <div className={`TickType s-vflex-center ${type}`}>
            {getContent()}
        </div>
    );
}