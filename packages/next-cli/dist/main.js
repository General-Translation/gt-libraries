#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gt_react_cli_1 = __importDefault(require("gt-react-cli"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
dotenv_1.default.config({ path: '.env.local', override: true });
(0, gt_react_cli_1.default)('gt-next');
