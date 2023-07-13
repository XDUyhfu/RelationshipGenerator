import { Children, FC, ReactElement, cloneElement } from "react";
// import { IReArray } from "../../type";
// import { getArrayByLength } from "../../utils";
//
// export const ReArray: FC<IReArray> = (props) => {
//     const { children, data } = props;
//
//     return (
//         <div className="re-array-container">
//             {getArrayByLength(length).map((_, index) => (
//                 <div key={index}>
//                     {Children.map(children, (item) =>
//                         cloneElement(item as ReactElement, {
//                             lineKey: index,
//                             arrName: data,
//                         })
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };
