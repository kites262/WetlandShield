# Assets Notes

当前前端只保留运行时实际使用的字体与图标子集，目的是控制构建体积。

后续如果要新增字体、图标、底图或其他素材，请先完成这一步：

1. 先将对应静态资源文件下载到 `apps/web/src/assets` 下的合适目录并提交入库。
2. 再更新 `main.ts`、对应 CSS 或组件引用。

注意：

- 不要直接写一个新的字体名、图标类名或外部文件路径，而不先补齐本地静态资源。
- 标题字体目前走 `apps/web/src/assets/fonts/DouyuFont/panel-title.css` 子集。
- 图标目前走 `apps/web/src/assets/fontawesome/css/icons.css` 最小集。
- 如果未来需要更多字形或图标，请先补静态文件，再扩展对应子集文件。
- `DincorosBlack`、`SarasaMonoSC` 和 Font Awesome 整包资源已移除；如果未来要恢复其中任一素材，先重新下载到 `apps/web/src/assets`，再补代码引用。
- `DouyuFont` 目录目前只保留运行时子集与少量元信息文件，后续若要扩字，也应先补齐新的静态字库文件再调整 `panel-title.css`。
