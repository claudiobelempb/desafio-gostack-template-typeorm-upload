"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var csv_parse_1 = __importDefault(require("csv-parse"));
var typeorm_1 = require("typeorm");
var upload_1 = __importDefault(require("../config/upload"));
var TransactionsRepository_1 = __importDefault(require("../repositories/TransactionsRepository"));
var Category_1 = __importDefault(require("../models/Category"));
var ImportTransactionsService = /** @class */ (function () {
    function ImportTransactionsService() {
    }
    ImportTransactionsService.prototype.execute = function (_a) {
        var filename = _a.filename;
        return __awaiter(this, void 0, void 0, function () {
            var categoriesRepository, transactionsRepository, transactionsToSave, categoriesCSV, parser, parseCSV, existentCategories, existentCategoriesTitles, addCategoriesTitle, newCategories, finalCategories, createdTransactions;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        categoriesRepository = typeorm_1.getRepository(Category_1.default);
                        transactionsRepository = typeorm_1.getCustomRepository(TransactionsRepository_1.default);
                        transactionsToSave = [];
                        categoriesCSV = [];
                        parser = csv_parse_1.default({ delimiter: ', ', from_line: 2, ltrim: true });
                        parseCSV = fs_1.default
                            .createReadStream(path_1.default.join(upload_1.default.directory, filename))
                            .pipe(parser);
                        parseCSV.on('data', function (row) { return __awaiter(_this, void 0, void 0, function () {
                            var title, type, value, category, transactionToSave;
                            return __generator(this, function (_a) {
                                title = row[0], type = row[1], value = row[2], category = row[3];
                                categoriesCSV.push(category);
                                transactionToSave = {
                                    title: title,
                                    type: type,
                                    value: Number(value),
                                    category: category,
                                };
                                transactionsToSave.push(transactionToSave);
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, new Promise(function (resolve) { return parseCSV.on('end', resolve); })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, categoriesRepository.find({
                                where: {
                                    title: typeorm_1.In(categoriesCSV),
                                },
                            })];
                    case 2:
                        existentCategories = _b.sent();
                        existentCategoriesTitles = existentCategories.map(function (category) { return category.title; });
                        addCategoriesTitle = categoriesCSV
                            .filter(function (category) { return !existentCategoriesTitles.includes(category); })
                            .filter(function (value, index, self) { return self.indexOf(value) === index; });
                        newCategories = categoriesRepository.create(addCategoriesTitle.map(function (title) { return ({ title: title }); }));
                        return [4 /*yield*/, categoriesRepository.save(newCategories)];
                    case 3:
                        _b.sent();
                        finalCategories = __spreadArrays(newCategories, existentCategories);
                        createdTransactions = transactionsRepository.create(transactionsToSave.map(function (transaction) {
                            var _a;
                            return ({
                                title: transaction.title,
                                type: transaction.type,
                                value: transaction.value,
                                category_id: (_a = finalCategories.find(function (category) { return category.title === transaction.category; })) === null || _a === void 0 ? void 0 : _a.id,
                            });
                        }));
                        return [4 /*yield*/, transactionsRepository.save(createdTransactions)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, fs_1.default.promises.unlink(path_1.default.join(upload_1.default.directory, filename))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, createdTransactions];
                }
            });
        });
    };
    return ImportTransactionsService;
}());
exports.default = ImportTransactionsService;
