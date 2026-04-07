import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Advisor {
    branch: string;
    name: string;
    year: bigint;
    sessionPrice: bigint;
    rating: number;
    college: string;
}
export interface backendInterface {
    addAdvisor(advisor: Advisor): Promise<void>;
    getAllAdvisors(): Promise<Array<Advisor>>;
    initialize(): Promise<void>;
    searchByBranch(keyword: string): Promise<Array<Advisor>>;
    searchByCollege(keyword: string): Promise<Array<Advisor>>;
}
